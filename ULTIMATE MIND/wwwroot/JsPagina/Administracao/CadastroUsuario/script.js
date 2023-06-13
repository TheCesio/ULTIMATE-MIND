var idUsuario = 0;

$(document).ready(function () {

    $('#m-cpf').mask('999.999.999-99');

    $("#m-telefone").mask("(99) 99999-9999");

    $('#selectFuncao').select2({
        dropdownParent: $('#modalCadastroCliente'),
        width: 'resolve',
        ajax: {
            url: urlSite + 'Administracao/ObterCargos',
            processResults: function (data) {
                var dados = [];
                $.each(data, function (index, item) {
                    var array = {
                        id: item.idcargo,
                        text: item.nome
                    }
                    dados.push(array);
                });
                return {
                    results: dados
                };
            }
        }
    });

    $('#selectStatus').select2({
        dropdownParent: $('#modalCadastroCliente'),
        width: 'resolve',
        ajax: {
            url: urlSite + 'Administracao/ObterStatus',
            processResults: function (data) {
                var dados = [];
                $.each(data, function (index, item) {
                    var array = {
                        id: item.id,
                        text: item.nome
                    }
                    dados.push(array);
                });
                return {
                    results: dados
                };
            }
        }
    });

    $('#selectGrupoPermissao').select2({
        dropdownParent: $('#modalCadastroCliente'),
        width: 'resolve',
        ajax: {
            url: urlSite + 'Administracao/ObterGrupoPermissao',
            processResults: function (data) {
                var dados = [];
                $.each(data, function (index, item) {
                    var array = {
                        id: item.idgrupoPermissao,
                        text: item.nome
                    }
                    dados.push(array);
                });
                return {
                    results: dados
                };
            }
        }
    });
    
    const emailInput = $('#m-email');

    // Aplica a máscara do email
    emailInput.mask('A', {
        translation: {
            A: { pattern: /[\w@\-.+]/, recursive: true }
        }
    });

    // Validação de email ao perder o foco
    emailInput.on('blur', function () {
        const email = $(this).val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            alert('Email inválido');
            $(this).val('');
        }
    });

    Post("Administracao/BuscarUsuarios", montarTela, Erro);

});


function montarTela(retorno) {

    if ($.fn.dataTable.isDataTable('#table-colab')) {
        $('#table-colab').DataTable().destroy();
    }

    var tabelaUsuarios = $('#table-colab').DataTable({
        "responsive": true,
        "scrollCollapse": true,
        "autoWidth": false,
        "ordering": false,
    });

    mostrarLoading();

    if (retorno != null && retorno != undefined) {

        tabelaUsuarios.clear();

        $.each(retorno, function (index, item) {
            tabelaUsuarios.row.add([
                item.matricula,
                item.nome,
                item.cpf,
                item.cargo,
                '<button class="btn btn-outline-info" onclick="editarUsuario(' + item.idusuario + ')">Editar</button>'
            ]);
        });

        tabelaUsuarios.paging = false;
        tabelaUsuarios.lengthChange = false;
        tabelaUsuarios.searching = true;
        tabelaUsuarios.ordering = false;
        tabelaUsuarios.info = true;
        ocultarLoading();
    }
}

function editarUsuario(id) {

    Post("Administracao/BuscarInfoUsuario/" + id, montarModalUsuario);
}

function montarModalUsuario(retorno) {

    if (retorno != null && retorno != undefined) {

        idUsuario = retorno.idUsuario;

        $('#m-matricula').val(retorno.matricula);
        $('#m-nome').val(retorno.nome);
        $('#m-cpf').val(retorno.cpf);
        $('#m-telefone').val(retorno.telefone);
        $('#m-email').val(retorno.email);
        $('#m-rg').val(retorno.rg);

        $('#m-dataNascimento').val(retorno.dataNascimento);
        $('#m-dataAdmissao').val(retorno.dataAdmissao);
        $('#m-dataDemissao').val(retorno.dataDemissao);

        var option = new Option(retorno.nomeStatus, retorno.status, true, true);
        $('#selectStatus').append(option).trigger('change');

        var optionFuncao = new Option(retorno.nomeCargo, retorno.idCargo, true, true);
        $('#selectFuncao').append(optionFuncao).trigger('change');

        var optionGrupoPermissao = new Option(retorno.nomeGrupoPermissao, retorno.idGrupoPermissao, true, true);
        $("#selectGrupoPermissao").append(optionGrupoPermissao).trigger('change');
    }

    $("#modalCadastroCliente").modal('show');
}

function novoUsuario() {

    idUsuario = 0;
    limparModal();
    $("#modalCadastroCliente").modal('show');
}

function salvarUsuario() {

    if (isEmptyOrNull($("#m-nome").val())) {
        Alerta("Informe o nome do Colaborador");
        return;
    }
    if (isEmptyOrNull($("#m-matricula").val())) {
        Alerta("Informe a Matrícula");
        return;
    }
    if (isEmptyOrNull($("#m-cpf").val())) {
        Alerta("Informe o Cpf");
        return;
    }
    if (isEmptyOrNull($("#selectStatus").val())) {
        Alerta("Informe o Status");
        return;
    }
    if (isEmptyOrNull($("#selectFuncao").val())) {
        Alerta("Informe a Função");
        return;
    }
    if (isEmptyOrNull($("#selectGrupoPermissao").val())) {
        Alerta("Informe o Grupo de Usuário");
        return;
    }

    var objet = {};

    objet.IdUsuario = idUsuario;
    objet.Matricula = $('#m-matricula').val();
    objet.Nome = $('#m-nome').val();
    objet.Cpf = $('#m-cpf').val();
    objet.Telefone = $('#m-telefone').val();
    objet.Email = $('#m-email').val();
    objet.Rg = $('#m-rg').val();
    objet.Status = $('#selectStatus').val();
    objet.IdCargo = $('#selectFuncao').val();
    objet.DataNascimento = $('#m-dataNascimento').val();
    objet.DataAdmissao = $('#m-dataAdmissao').val();
    objet.DataDemissao = $('#m-dataDemissao').val();
    objet.IdGrupoPermissao = $("#selectGrupoPermissao").val();

    PostDados("Administracao/SalvarUsuario", { dados: JSON.stringify(objet) }, SalvarUsuarioResult);
}

function limparModal() {
    $('#m-matricula').val("");
    $('#m-nome').val("");
    $('#m-cpf').val("");
    $('#m-telefone').val("");
    $('#m-email').val("");
    $('#m-rg').val("");
    $("#selectStatus").val(null).trigger('change');
    $("#selectFuncao").val(null).trigger('change');
    $("#selectGrupoPermissao").val(null).trigger('change');
    $('#m-dataNascimento').val("");
    $('#m-dataAdmissao').val("");
    $('#m-dataDemissao').val("");
}

function SalvarUsuarioResult() {

    $("#modalCadastroCliente").modal('hide');
    limparModal();
    $.alert("Usuário Cadastrado com Sucesso!");

    Post("Administracao/BuscarUsuarios", montarTela, Erro);
}
